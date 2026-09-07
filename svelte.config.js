import adapter from '@sveltejs/adapter-vercel';

const config = {
  kit: {
    adapter: adapter()
  },
  compilerOptions: {
    runes: ({ filename }) =>
      filename.split(/[/\\]/).includes('node_modules') ? undefined : true
  }
};

export default config;
