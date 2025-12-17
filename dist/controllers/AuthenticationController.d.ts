import type { Request, Response } from "express";
declare class AuthenticationController {
    private authService;
    constructor();
    register(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
    logout(req: Request, res: Response): Promise<void>;
}
export default AuthenticationController;
//# sourceMappingURL=AuthenticationController.d.ts.map