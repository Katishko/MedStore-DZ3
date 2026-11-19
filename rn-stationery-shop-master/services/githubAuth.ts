import { GITHUB_CLIENT_ID } from '../config/auth';

const DEVICE_CODE_URL = 'https://github.com/login/device/code';
const ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const USER_URL = 'https://api.github.com/user';

export interface GitHubDeviceAuthorization {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  expiresIn: number;
  interval: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function requestJson(url: string, init: RequestInit): Promise<Record<string, unknown>> {
  const response = await fetch(url, init);
  const payload: unknown = await response.json();

  if (!response.ok) {
    const message = isRecord(payload) && typeof payload.error_description === 'string'
      ? payload.error_description
      : `GitHub вернул ошибку HTTP ${response.status}.`;
    throw new Error(message);
  }

  if (!isRecord(payload)) {
    throw new Error('GitHub вернул некорректный ответ.');
  }

  return payload;
}

function requiredString(payload: Record<string, unknown>, key: string): string {
  const value = payload[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`В ответе GitHub отсутствует поле ${key}.`);
  }
  return value;
}

export async function startGitHubDeviceAuthorization(): Promise<GitHubDeviceAuthorization> {
  if (GITHUB_CLIENT_ID === 'YOUR_GITHUB_OAUTH_CLIENT_ID') {
    throw new Error('Сначала укажите Client ID GitHub OAuth App в config/auth.ts.');
  }

  const payload = await requestJson(DEVICE_CODE_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `client_id=${encodeURIComponent(GITHUB_CLIENT_ID)}&scope=read%3Auser`,
  });

  const expiresIn = payload.expires_in;
  const interval = payload.interval;
  if (typeof expiresIn !== 'number' || typeof interval !== 'number') {
    throw new Error('GitHub вернул некорректные параметры авторизации.');
  }

  return {
    deviceCode: requiredString(payload, 'device_code'),
    userCode: requiredString(payload, 'user_code'),
    verificationUri: requiredString(payload, 'verification_uri'),
    expiresIn,
    interval,
  };
}

function delay(milliseconds: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout>;
    const cancel = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', cancel);
      reject(new Error('Авторизация GitHub отменена.'));
    };
    timer = setTimeout(() => {
      signal.removeEventListener('abort', cancel);
      resolve();
    }, milliseconds);

    if (signal.aborted) {
      cancel();
    } else {
      signal.addEventListener('abort', cancel, { once: true });
    }
  });
}

export async function pollGitHubDeviceAuthorization(
  authorization: GitHubDeviceAuthorization,
  signal: AbortSignal,
): Promise<string> {
  const expiresAt = Date.now() + authorization.expiresIn * 1000;
  let interval = authorization.interval;

  while (Date.now() < expiresAt) {
    await delay(Math.min(interval * 1000, expiresAt - Date.now()), signal);
    if (signal.aborted) {
      throw new Error('Авторизация GitHub отменена.');
    }

    const payload = await requestJson(ACCESS_TOKEN_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `client_id=${encodeURIComponent(GITHUB_CLIENT_ID)}&device_code=${encodeURIComponent(authorization.deviceCode)}&grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Adevice_code`,
      signal,
    });

    if (typeof payload.error === 'string') {
      if (payload.error === 'authorization_pending') {
        continue;
      }
      if (payload.error === 'slow_down') {
        interval += 5;
        continue;
      }
      if (payload.error === 'expired_token') {
        throw new Error('Время авторизации GitHub истекло. Попробуйте ещё раз.');
      }
      if (payload.error === 'access_denied') {
        throw new Error('Авторизация GitHub отклонена.');
      }
      throw new Error(
        typeof payload.error_description === 'string'
          ? payload.error_description
          : `Ошибка авторизации GitHub: ${payload.error}.`,
      );
    }

    const accessToken = requiredString(payload, 'access_token');
    const user = await requestJson(USER_URL, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${accessToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal,
    });
    return requiredString(user, 'login');
  }

  throw new Error('Время авторизации GitHub истекло. Попробуйте ещё раз.');
}
