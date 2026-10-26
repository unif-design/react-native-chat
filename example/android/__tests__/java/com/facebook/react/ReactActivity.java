package com.facebook.react;
public abstract class ReactActivity {
  protected abstract String getMainComponentName();
  protected abstract ReactActivityDelegate createReactActivityDelegate();
  public String componentNameForTest() { return getMainComponentName(); }
  public ReactActivityDelegate delegateForTest() {
    return createReactActivityDelegate();
  }
}
