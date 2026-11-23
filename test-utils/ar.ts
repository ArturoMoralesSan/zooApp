import { jest } from '@jest/globals'
import { Component } from 'react'

// ViroReact and expo-camera for useArAvailability. Mock them per file,
// lazily (without a factory, importing ViroReact fails: it ships JSX):
//
//   jest.mock('@reactvision/react-viro', () =>
//     jest.requireActual<typeof import('<path>/test-utils/ar')>(
//       '<path>/test-utils/ar',
//     ).viroMock,
//   )
//   jest.mock('expo-camera', () => ... .expoCameraMock)
//
// Screens with an AR view also take ViroARSceneNavigatorStub (spread it in
// with viroMock as ViroARSceneNavigator).
type Support = { isARSupported: boolean }

export const viroMock = {
	// ARCore's answer: resolves when supported, rejects with its state
	// ('UNSUPPORTED', 'TRANSIENT'…) otherwise.
	isARSupportedOnDevice: jest.fn(async (): Promise<Support> => ({
		isARSupported: true,
	})),
	// Scenes create their materials when the module loads.
	ViroMaterials: { createMaterials: jest.fn() },
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

type ScreenshotResult = { success: boolean; url?: string; errorCode?: number }

// What the stub's _takeScreenshot answers: where Viro left the shot.
export const arScreenshot = jest.fn(async (): Promise<ScreenshotResult> => ({
	success: true,
	url: '/mock/cache/viro.jpg',
}))

type StubProps = { viroAppProps?: { onModelReady?: () => void } }

// The viroAppProps of every navigator mounted: what the scene would get.
export const arSceneProps = jest.fn((props: unknown) => props)

// ViroARSceneNavigator without a native view: renders nothing, reports the
// scene's model as loaded and takes "screenshots" (arScreenshot).
export class ViroARSceneNavigatorStub extends Component<StubProps> {
	componentDidMount() {
		arSceneProps(this.props.viroAppProps)
		this.props.viroAppProps?.onModelReady?.()
	}

	componentDidUpdate() {
		arSceneProps(this.props.viroAppProps)
	}

	_takeScreenshot = () => arScreenshot()

	render() {
		return null
	}
}
