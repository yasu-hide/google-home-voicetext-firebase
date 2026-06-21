'use strict';
require('date-utils');

const { validateEnv, buildEndpointUrl, handleSnapshot, handleFirestoreError } = require('../lib/handler');

describe('validateEnv', () => {
    beforeEach(() => {
        vi.stubEnv('SERVER_ADDRESS', 'localhost');
        vi.stubEnv('DEVICE_ADDRESS', '/api/tts');
        vi.stubEnv('FIREBASE_CREDENTIAL', '/tmp/cred.json');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    test('全必須 env が揃っている場合はエラーをスローしない', () => {
        expect(() => validateEnv()).not.toThrow();
    });

    test('SERVER_ADDRESS が未設定の場合 "SERVER_ADDRESS required." をスロー', () => {
        vi.stubEnv('SERVER_ADDRESS', '');
        expect(() => validateEnv()).toThrow('SERVER_ADDRESS required.');
    });

    test('DEVICE_ADDRESS が未設定の場合 "DEVICE_ADDRESS required." をスロー', () => {
        vi.stubEnv('DEVICE_ADDRESS', '');
        expect(() => validateEnv()).toThrow('DEVICE_ADDRESS required.');
    });

    test('FIREBASE_CREDENTIAL が未設定の場合 "FIREBASE_CREDENTIAL required." をスロー', () => {
        vi.stubEnv('FIREBASE_CREDENTIAL', '');
        expect(() => validateEnv()).toThrow('FIREBASE_CREDENTIAL required.');
    });
});

describe('buildEndpointUrl', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    test('SERVER_PORT 指定あり: 正しい URL を返す', () => {
        vi.stubEnv('SERVER_ADDRESS', '192.168.1.10');
        vi.stubEnv('DEVICE_ADDRESS', '/api/tts');
        vi.stubEnv('SERVER_PORT', '9090');
        expect(buildEndpointUrl()).toBe('http://192.168.1.10:9090/api/tts');
    });

    test('SERVER_PORT 未指定: デフォルト 8080 を使う', () => {
        vi.stubEnv('SERVER_ADDRESS', '192.168.1.10');
        vi.stubEnv('DEVICE_ADDRESS', '/api/tts');
        expect(buildEndpointUrl()).toBe('http://192.168.1.10:8080/api/tts');
    });
});

describe('handleSnapshot', () => {
    let mockDocument;
    let mockFetch;

    beforeEach(() => {
        mockDocument = { update: vi.fn().mockResolvedValue(undefined) };
        mockFetch = vi.fn().mockResolvedValue({ text: vi.fn().mockResolvedValue('OK') });
        global.fetch = mockFetch;
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete global.fetch;
    });

    test('message が空の場合: fetch も document.update も呼ばれない', async () => {
        const snapshot = { get: vi.fn().mockReturnValue('') };
        await handleSnapshot(snapshot, 'http://localhost:8080/tts', mockDocument);
        expect(mockFetch).not.toHaveBeenCalled();
        expect(mockDocument.update).not.toHaveBeenCalled();
    });

    test('message が null の場合: fetch も document.update も呼ばれない', async () => {
        const snapshot = { get: vi.fn().mockReturnValue(null) };
        await handleSnapshot(snapshot, 'http://localhost:8080/tts', mockDocument);
        expect(mockFetch).not.toHaveBeenCalled();
        expect(mockDocument.update).not.toHaveBeenCalled();
    });

    test('message がある場合: 正しい URL・メソッド・body で fetch を呼ぶ', async () => {
        const snapshot = { get: vi.fn().mockReturnValue('こんにちは') };
        await handleSnapshot(snapshot, 'http://localhost:8080/tts', mockDocument);
        expect(mockFetch).toHaveBeenCalledWith(
            'http://localhost:8080/tts',
            expect.objectContaining({ method: 'POST', body: expect.any(URLSearchParams) })
        );
        const body = mockFetch.mock.calls[0][1].body;
        expect(body.get('text')).toBe('こんにちは');
    });

    test('POST 成功後: document.update({ message: "" }) を呼ぶ', async () => {
        const snapshot = { get: vi.fn().mockReturnValue('hello') };
        await handleSnapshot(snapshot, 'http://localhost:8080/tts', mockDocument);
        expect(mockDocument.update).toHaveBeenCalledWith({ message: '' });
    });

    test('fetch が失敗した場合: document.update は呼ばれず console.error を呼ぶ', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('network error'));
        const snapshot = { get: vi.fn().mockReturnValue('hello') };
        await handleSnapshot(snapshot, 'http://localhost:8080/tts', mockDocument);
        expect(mockDocument.update).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(expect.any(Error));
    });

    test('document.update が失敗した場合: fetch は呼ばれ、console.error を呼ぶ', async () => {
        mockDocument.update = vi.fn().mockRejectedValue(new Error('firestore error'));
        const snapshot = { get: vi.fn().mockReturnValue('hello') };
        await handleSnapshot(snapshot, 'http://localhost:8080/tts', mockDocument);
        expect(mockFetch).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(expect.any(Error));
    });
});

describe('handleFirestoreError', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('Firestore エラー時に console.error を2回呼ぶ', () => {
        const err = new Error('Firestore unavailable');
        const document = { path: '/googlehome/chant' };
        handleFirestoreError(err, document);
        expect(console.error).toHaveBeenCalledWith('Firestore error:', err);
        expect(console.error).toHaveBeenCalledWith(document);
    });
});
