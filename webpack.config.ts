import path from "path";
import { Configuration, DefinePlugin } from "webpack";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import CopyWebpackPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import Dotenv from "dotenv-webpack";

// Define the interface for environment variables
interface Env {
  NODE_ENV: "production" | "development";
}

// Webpack configuration function
export default (env: Env): Configuration => {
  // Determine the dotenv file based on the environment
  const dotenvFilename =
    env.NODE_ENV === "production" ? ".env.production" : ".env.development";

  return {
    // Set mode based on the environment (default is "none" if not set)
    mode: env.NODE_ENV ?? "none",
    
    // Source map configuration based on the environment
    devtool:
      env.NODE_ENV === "production" ? "source-map" : "cheap-module-source-map",
    
    // Entry points for the application
    entry: {
      popup: "./src/popup/index.tsx", // Entry for the popup
      contentScript: "./src/contentScript/contentScript.ts", // Entry for the content script
    },
    
    // Module rules for handling different file types
    module: {
      rules: [
        {
          // TypeScript files
          use: "ts-loader",
          test: /\.tsx?$|\.d\.ts$/, // Matches .ts and .tsx files, including type declaration files
          exclude: /node_modules/, // Exclude node_modules from being processed
        },
        {
          // CSS files
          test: /\.css$/i,
          use: [
            "style-loader", // Injects CSS into the DOM
            {
              loader: "css-loader",
              options: {
                importLoaders: 1, // Number of loaders to apply before css-loader
              },
            },
            {
              loader: "postcss-loader", // PostCSS loader needed for Tailwind CSS
              options: {
                postcssOptions: {
                  ident: "postcss",
                  plugins: [tailwindcss, autoprefixer], // Apply Tailwind CSS and autoprefixer
                },
              },
            },
          ],
        },
        {
          // SVG files
          test: /\.svg$/,
          use: ["@svgr/webpack"], // Load SVGs as React components
        },
      ],
    },
    
    // Resolve module paths and extensions
    resolve: {
      extensions: [".tsx", ".ts", ".js"], // Extensions to resolve
      alias: {
        "@": path.resolve(__dirname, "src/popup"), // Alias for convenient imports
      },
    },
    
    // Output configuration
    output: {
      filename: "[name].js", // Output filename template for chunks
      path: path.resolve(__dirname, "cognitovault"), // Output directory
    },
    
    // Optimization settings
    optimization: {
      splitChunks: {
        chunks: "all", // Split all chunks for better caching
      },
    },
    
    // Plugins for additional functionality
    plugins: [
      new CleanWebpackPlugin({
        cleanStaleWebpackAssets: false, // Do not remove assets that are still referenced
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: path.resolve("src/static"), to: path.resolve("dist") }, // Copy static assets to dist
        ],
      }),
      new Dotenv({
        path: dotenvFilename, // Load environment variables from the appropriate file
      }),
      new DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(env.NODE_ENV), // Define NODE_ENV in the build
      }),
      ...getHtmlPlugins(["popup"]), // Generate HTML files for each entry
    ],
  };
};

// Function to generate HTML plugins for each chunk
function getHtmlPlugins(chunks: string[]) {
  return chunks.map(
    (chunk: string) =>
      new HtmlWebpackPlugin({
        title: "CognitoVault", // Title for the HTML files
        filename: `${chunk}.html`, // Output filename for the HTML files
        chunks: [chunk], // Include only the specified chunk in each HTML file
      })
  );
}
