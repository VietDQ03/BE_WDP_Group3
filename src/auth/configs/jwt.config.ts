import { registerAs } from "@nestjs/config";
import { JwtModuleOptions } from "@nestjs/jwt";
import ms from "ms";

export default registerAs(
    'jwt',
    (): JwtModuleOptions => ({
        secret: process.env.JWT_ACCESS_TOKEN,
        signOptions: {
            expiresIn: ms(process.env.JWT_ACCESS_EXPIRE),
        },
    })
)