export default {
  nodeResolve: true,
  port: 8000,
  preserveSymlinks: true,
  watch: true,
  plugins: [
    {
      name: 'custom-headers',
      transform(context) {
        context.set('X-DevServer-Path', context.path);
      }
    }
  ]
};
