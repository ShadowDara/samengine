import { withSamengine } from "samengine-build-web/next";

const nextConfig = {
  output: "export",
  reactStrictMode: true,
};

export default withSamengine(nextConfig, {
  resourcesDir: "resources",
  resourceBase: "samengine/resources",
  outResourcesDir: "samengine/resources",
});
