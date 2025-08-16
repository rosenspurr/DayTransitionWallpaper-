import Gtk from "gi://Gtk";

export default class Preferences {
  constructor() {}

  fillPreferencesWindow(window) {
    window.set_default_size(400, 300);

    // Simple empty container
    const box = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
      spacing: 6,
    });

    window.set_child(box);
  }
}
