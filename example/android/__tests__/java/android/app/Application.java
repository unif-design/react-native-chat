package android.app;
public class Application extends android.content.Context {
  public int superCreateCalls;
  public android.content.Context getApplicationContext() { return this; }
  public void onCreate() { superCreateCalls++; }
}
