import UIKit
public enum RCTLinkingManager {
  public static func scene(_ scene: UIScene, openURLContexts contexts: Set<UIOpenURLContext>) {
    Boundary.record("link.url", ["scene": scene, "contexts": contexts])
  }
  public static func scene(_ scene: UIScene, continue activity: NSUserActivity) {
    Boundary.record("link.activity", ["scene": scene, "activity": activity])
  }
}
public final class RCTBundleURLProvider {
  private static let shared = RCTBundleURLProvider()
  public static func sharedSettings() -> RCTBundleURLProvider { shared }
  public func jsBundleURL(forBundleRoot root: String) -> URL? {
    Boundary.record("bundle", ["root": root])
    return Boundary.bundle
  }
}
