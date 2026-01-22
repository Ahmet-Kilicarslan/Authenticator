import type {NextFunction, Request, Response} from "express";


export default function requirePermission(permission: string) {
    return async (req: Request, res: Response, next: NextFunction) => {

        const session = (req as any).session;

        const userPermissions: string [] = session.permissions;
        console.log(userPermissions);

        let permit: boolean = false;

        for (let i: number = 0; i < userPermissions.length; i++) {
            if (userPermissions[i] === permission) {
                permit = true;
                next();
                return;
            }

        }
        if (permit) {
            next();
        } else {
            res.status(403).json({
                error: 'Forbidden',
                message: 'You do not have permission to perform this action'
            });
        }

    }
}