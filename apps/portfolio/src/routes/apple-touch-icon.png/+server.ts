import { appleTouchIconResponse } from "@mth/ui/og";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = () => appleTouchIconResponse();
