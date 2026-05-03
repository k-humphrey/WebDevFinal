/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "../HTML/index.html",
    "../node_modules/flowbite/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#8a1f1f",
        primaryText: "#fff5f5",
        secondary: "#fdb0b0",
        tertiary: "#f6ffe6",
        CherryComp: "#FF5B4F",
        Cherry: "#4fff5b"
      }
    },
    fontFamily: {
      'body': [
    'Noto Sans', 
    'ui-sans-serif', 
    'system-ui', 
    '-apple-system', 
    'system-ui', 
    'Segoe UI', 
    'Roboto', 
    'Helvetica Neue', 
    'Arial', 
    'Noto Sans', 
    'sans-serif', 
    'Apple Color Emoji', 
    'Segoe UI Emoji', 
    'Segoe UI Symbol', 
    'Noto Color Emoji'
  ],
      'sans': [
    'Noto Sans', 
    'ui-sans-serif', 
    'system-ui', 
    '-apple-system', 
    'system-ui', 
    'Segoe UI', 
    'Roboto', 
    'Helvetica Neue', 
    'Arial', 
    'Noto Sans', 
    'sans-serif', 
    'Apple Color Emoji', 
    'Segoe UI Emoji', 
    'Segoe UI Symbol', 
    'Noto Color Emoji'
  ]
    }
},
  plugins: [
    require('flowbite/plugin')
  ],
}

