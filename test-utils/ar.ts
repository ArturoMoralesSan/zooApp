import { jest } from '@jest/globals'

// ViroReact and expo-camera for useArAvailability. Mock them per file,
// lazily (without a factory, importing ViroReact fails: it ships JSX):
//
//   jest.mock('@reactvision/react-viro', () =>
//     jest.requireActual<typeof import('<path>/test-utils/ar')>(
//       '<path>/test-utils/ar',
//     ).viroMock,
//   )
//   jest.mock('expo-camera', () => ... .expoCameraMock)
type Support = { isARSupported: boolean }

export const viroMock = {
	// ARCore's answer: resolves when supported, rejects with its state
	// ('UNSUPPORTED', 'TRANSIENT'…) otherwise.
	isARSupportedOnDevice: jest.fn(async (): Promise<Support> => ({
		isARSupported: true,
	})),
}

type CameraPermission = { granted: boolean; canAskAgain: boolean }

export const camera = {
	// null while expo-camera reads it.
	permission: { granted: true, canAskAgain: true } as CameraPermission | null,
	request: jest.fn(async () => camera.permission),
}

export const expoCameraMock = {
	useCameraPermissions: () => [camera.permission, camera.request] as const,
}

export const arcoreState = (state: string) => new Error(state)
