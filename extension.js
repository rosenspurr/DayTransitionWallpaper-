/* Top-level imports */
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import GLib from "gi://GLib";
import Gio from "gi://Gio";
import St from "gi://St";

export default class DayTransitionWallpaperExtension extends Extension {
  _timeoutId = null;
  _settings = null;
  _overlay = null;

  enable() {
    // GSettings to change wallpapers
    this._settings = new Gio.Settings({
      schema_id: "org.gnome.desktop.background",
    });

    // Create full-screen overlay
    this._overlay = new St.Widget({
      x: 0,
      y: 0,
      width: global.stage.width,
      height: global.stage.height,
      reactive: false,
      visible: true,
      opacity: 0,
      style: "background-size: cover;",
    });

    Main.layoutManager.addChrome(this._overlay);

    // Start the wallpaper loop
    this._updateWallpaper();
  }

  disable() {
    if (this._timeoutId) {
      GLib.Source.remove(this._timeoutId);
      this._timeoutId = null;
    }
    if (this._overlay) {
      this._overlay.destroy();
      this._overlay = null;
    }
  }

  _updateWallpaper() {
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;

    // Define schedule
    const schedule = [
      {
        start: 6,
        path: "/home/rosenspurr/Pictures/wallpapers/infinity/F8-wallpaper-morning.png",
      },
      {
        start: 11,
        path: "/home/rosenspurr/Pictures/wallpapers/infinity/F8-wallpaper-day.png",
      },
      {
        start: 17,
        path: "/home/rosenspurr/Pictures/wallpapers/infinity/F8-wallpaper-sunset.png",
      },
      {
        start: 19,
        path: "/home/rosenspurr/Pictures/wallpapers/infinity/F8-wallpaper-night.png",
      },
    ];

    // Determine current and next wallpapers
    let current = schedule[0];
    let next = schedule[1];
    for (let i = 0; i < schedule.length; i++) {
      if (hour >= schedule[i].start) {
        current = schedule[i];
        next = schedule[(i + 1) % schedule.length];
      }
    }

    // Set current wallpaper
    const uri = `file://${current.path}`;
    this._settings.set_string("picture-uri", uri);
    this._settings.set_string("picture-uri-dark", uri);

    // Calculate progress into current time window
    const windowLength = (next.start - current.start + 24) % 24;
    const progress = ((hour - current.start + 24) % 24) / windowLength;

    // Update overlay style with next wallpaper and alpha
    this._overlay.set_style(`
            background-image: url('file://${next.path}');
            background-size: cover;
        `);
    this._overlay.opacity = Math.round(progress * 255);

    // Repeat every minute
    this._timeoutId = GLib.timeout_add_seconds(
      GLib.PRIORITY_DEFAULT,
      60,
      () => {
        this._updateWallpaper();
        return GLib.SOURCE_CONTINUE;
      },
    );
  }
}
