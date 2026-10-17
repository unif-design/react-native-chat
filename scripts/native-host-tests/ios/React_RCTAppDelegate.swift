import UIKit
open class RCTDefaultReactNativeFactoryDelegate: NSObject {
  public var dependencyProvider: AnyObject?
  open func bundleURL() -> URL? { nil }
}
public struct RCTDevMenuConfiguration {
  public let devMenuEnabled: Bool
  public let shakeGestureEnabled: Bool
  public let keyboardShortcutsEnabled: Bool
  public init(devMenuEnabled: Bool, shakeGestureEnabled: Bool, keyboardShortcutsEnabled: Bool) {
    self.devMenuEnabled = devMenuEnabled
    self.shakeGestureEnabled = shakeGestureEnabled
    self.keyboardShortcutsEnabled = keyboardShortcutsEnabled
  }
}
open class RCTReactNativeFactory: NSObject {
  public let delegate: RCTDefaultReactNativeFactoryDelegate
  public var devMenuConfiguration: RCTDevMenuConfiguration?
  public init(delegate: RCTDefaultReactNativeFactoryDelegate) { self.delegate = delegate }
  public func startReactNative(withModuleName module: String, in window: UIWindow?, connectionOptions: UIScene.ConnectionOptions) {
    Boundary.record("start", ["module": module, "window": window as Any, "options": connectionOptions])
  }
}
