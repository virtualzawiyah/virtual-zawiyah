import { Router, type IRouter } from "express";
import healthRouter from "./health";
import admissionsRouter from "./admissions";
import contactsRouter from "./contacts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(admissionsRouter);
router.use(contactsRouter);

export default router;
