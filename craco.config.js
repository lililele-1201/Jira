const CracoLessPlugin = require('craco-less');
const path = require('path');

module.exports = {
  webpack: {
    alias: {
      types: path.resolve(__dirname, 'src/types'),
    },
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              '@primary-color': 'rgb(0, 82, 204)',  '@font-size-base':'16px' // antd 主题色
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
