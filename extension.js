import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import GLib from "gi://GLib";
import Gio from "gi://Gio";

export default class DayTransitionWallpaperExtension extends Extension {
  _timeoutId = null;
  _settings = null;
  _wallpaperPath = null;

  constructor(metadata) {
    super(metadata);
    // Path to the extension folder
    this._extensionPath = metadata.dir.get_path();
    // Path to the wallpapers folder
    this._wallpaperPath = `${this._extensionPath}/wallpapers/`;
    log("This is a debug message");
  }

  enable() {
    this._settings = new Gio.Settings({
      schema_id: "org.gnome.desktop.background",
    });

    this._updateWallpaper();
  }

  disable() {
    if (this._timeoutId) {
      GLib.Source.remove(this._timeoutId);
      this._timeoutId = null;
    }
  }

  _updateWallpaper() {
    const now = new Date();
    const hour = now.getHours();

    // Determine which wallpaper to use
    let wallpaperFile;
    if (hour >= 6 && hour <= 10) {
      wallpaperFile = "F8-wallpaper-morning.png";
    } else if (hour < 17) {
      wallpaperFile = "F8-wallpaper-day.png";
    } else if (hour < 19) {
      wallpaperFile = "F8-wallpaper-sunset.png";
    } else {
      wallpaperFile = "F8-wallpaper-night.png";
    }

    const uri = `file://${this._wallpaperPath}${wallpaperFile}`;
    this._settings.set_string("picture-uri", uri);
    this._settings.set_string("picture-uri-dark", uri);

    // Update every 2 minutes
    this._timeoutId = GLib.timeout_add_seconds(
      GLib.PRIORITY_DEFAULT,
      120,
      () => {
        this._updateWallpaper();
        return GLib.SOURCE_CONTINUE;
      },
    );
  }
}
