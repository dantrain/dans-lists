#!/usr/bin/env zx
import { $, sleep } from "zx";

process.env.FORCE_COLOR = "1";

$`docker run  -p 5432:5432 -e POSTGRES_PASSWORD=pass postgres`;

await $`wait-on tcp:5432`;
await sleep(500);
await $`prisma db push`;
await $`tsx prisma/seed.ts`;

$`next dev`;
