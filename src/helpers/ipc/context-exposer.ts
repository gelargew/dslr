import { exposeWindowContext } from "./window/window-context";
import { exposeDatabaseContext } from "./database/database-context";
import { exposeStorageContext } from "./storage/storage-context";
import { exposeCameraContext } from "./camera/camera-context";
import { exposeConfigContext } from "./config/config-context";

export default function exposeContexts() {
  exposeWindowContext();
  exposeDatabaseContext();
  exposeStorageContext();
  exposeCameraContext();
  exposeConfigContext();
}
