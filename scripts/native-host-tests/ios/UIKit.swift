@_exported import Foundation

@_silgen_name("native_host_tests") private func runNativeHostTests()
open class UIResponder: NSObject {}
public protocol UIApplicationDelegate: AnyObject {}
public extension UIApplicationDelegate {
  // Keep the production @main; substitute only the SDK application event loop.
  static func main() { runNativeHostTests() }
}
open class UIApplication: NSObject {
  public struct LaunchOptionsKey: Hashable { public init() {} }
}
open class UIScene: NSObject {
  public struct ConnectionOptions { public init() {} }
}
open class UISceneSession: NSObject {}
open class UIWindowScene: UIScene {}
open class UIWindow: UIResponder {
  public let windowScene: UIWindowScene
  public init(windowScene: UIWindowScene) { self.windowScene = windowScene }
}
open class UIOpenURLContext: NSObject {
  public let url: URL
  public init(url: URL) { self.url = url }
}
public protocol UIWindowSceneDelegate: AnyObject {}
public enum Boundary {
  public static var events: [(String, [String: Any])] = []
  public static var bundle: URL? = URL(string: "http://localhost:8081/index.bundle")
  public static func record(_ name: String, _ arguments: [String: Any]) {
    events.append((name, arguments))
  }
}
