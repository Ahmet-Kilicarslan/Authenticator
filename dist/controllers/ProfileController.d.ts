import type { Request, Response } from "express";
declare class ProfileController {
    private ProfileService;
    private SessionService;
    constructor();
    getUserProfile(req: Request, res: Response): Promise<void>;
}
export default ProfileController;
//# sourceMappingURL=ProfileController.d.ts.map