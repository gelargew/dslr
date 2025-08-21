import { exposeThemeContext } from "./theme/theme-context";
import { exposeWindowContext } from "./window/window-context";
import { exposeDatabaseContext } from "./database/database-context";
import { exposeStorageContext } from "./storage/storage-context";
import { exposeCameraContext } from "./camera/camera-context";

export default function exposeContexts() {
  exposeWindowContext();
  exposeThemeContext();
  exposeDatabaseContext();
  exposeStorageContext();
  exposeCameraContext();
}
