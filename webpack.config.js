import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export default {
  entry: './index.js',
  output: {
    filename: 'geneartive-ai-bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type : "module"
    } 
  },
  experiments  :{
    outputModule : true , 
  } ,
  resolve: {
    alias : {
      "@google/generative-ai" : path.resolve(__dirname , 'node_modules/@google/generative-ai')
    } ,
  },
  mode: 'production' ,
  devServer: {
    static: './dist',
  },
  
};
