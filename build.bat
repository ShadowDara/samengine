@echo off

cd packages/samengine
bun i
bun run build
cd ../..

cd packages/samengine-build
bun i
bun run build
cd ../..

@REM cd packages/samengine-build-react
@REM bun i
@REM bun run build
@REM cd ../..

cd packages/samengine-cli
bun i
bun run build
cd ../..

cd packages/minisite2
bun i
bun run build
cd ../..

echo Finished!
