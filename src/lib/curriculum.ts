export {
  getCurriculumAsync as getCurriculum,
  getCollectionsAsync as getCollections,
  getCollectionAsync as getCollection,
  getItemAsync as getItem,
  getDefaultCollectionAsync as getDefaultCollection,
  getAllCollectionsForAdmin,
} from "./curriculum-db";

/** @deprecated Use getCollection */
export { getCollectionAsync as getCourse } from "./curriculum-db";

/** @deprecated Use getItem */
export { getItemAsync as getLesson } from "./curriculum-db";

/** @deprecated Use getDefaultCollection */
export { getDefaultCollectionAsync as getDefaultCourse } from "./curriculum-db";
