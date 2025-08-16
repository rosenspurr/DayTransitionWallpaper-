import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import GLib from "gi://GLib";
import Gio from "gi://Gio";

export default class DayTransitionWallpaperExtension extends Extension {
  _timeoutId = null;
  _settings = null;

  enable() {
    // Create a GSettings object to change the wallpaper
    this._settings = new Gio.Settings({
      schema_id: "org.gnome.desktop.background",
    });

    // Start the wallpaper loop
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

    let path;
    if (hour >= 6 && hour <= 10) {
      path =
        "/home/rosenspurr/Pictures/wallpapers/infinity/F8-wallpaper-morning.png";
    } else if (hour < 17) {
      path =
        "/home/rosenspurr/Pictures/wallpapers/infinity/F8-wallpaper-day.png";
    } else if (hour < 19) {
      path =
        "/home/rosenspurr/Pictures/wallpapers/infinity/F8-wallpaper-sunset.png";
    } else {
      path =
        "/home/rosenspurr/Pictures/wallpapers/infinity/F8-wallpaper-night.png";
    }

    const uri = `file://${path}`;
    this._settings.set_string("picture-uri", uri);
    this._settings.set_string("picture-uri-dark", uri);

    // Check again in 2 minutes
    this._timeoutId = GLib.timeout_add_seconds(
      GLib.PRIORITY_DEFAULT,
      120,
      () => {
        this._updateWallpaper();
        return GLib.SOURCE_CONTINUE; // keep repeating
      },
    );
  }
}
