import { exposeThemeContext } from "./theme/theme-context";
import { exposeWindowContext } from "./window/window-context";
import { exposeDatabaseContext } from "./database/database-context";
import { exposeStorageContext } from "./storage/storage-context";
import { exposeCameraContext } from "./camera/camera-context";
import { exposeConfigContext } from "./config/config-context";
import { exposeModalContext } from "./modal/modal-context";

export default function exposeContexts() {
  exposeWindowContext();
  exposeThemeContext();
  exposeDatabaseContext();
  exposeStorageContext();
  exposeCameraContext();
  exposeConfigContext();
  exposeModalContext();
}
