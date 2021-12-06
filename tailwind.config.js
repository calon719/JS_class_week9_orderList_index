module.exports = {
  purge: {
    enabled: true,
    content: ["./app/**/*.html", "./app/assets/style/**/*.scss", "./app/**/*.js", "./app/**/*.ejs"],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: "0"
      },
    },
    screens: {
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
      '2xl': '1440px',
    },
    colors: {
      primary: '#6A33F8',
      secondary: '#301E5F',
      danger: '#C72424',
      success: '#6A33FF',
      info: '#0067CE',
      dark: '#000',
      white: '#fff',
      'gray-100': '#F8F8F8',
      'gray-200': '#CED4DA',
      'gray-300': '#B9B9B9',
      'gray-400': '#818A91',
      'gray-500': '#797979'
    },
    fontSize: {
      'tiny': '.875rem',
      'base': '1rem',
      'lg': '1.125rem',
      'xl': '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.75rem',
      '4xl': '2rem',
      '5xl': '3rem',
      '6xl': '4rem',
      '7xl': '5rem',
    },
    gap: {
      '1': '15px',
      '2': '30px',
    },
    extend: {
      spacing: {
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '27': '6.75rem',
        '35': '8.75rem',
        '75': '18.75rem',
        '87': '21.75rem',
        '105': '26.25rem',
      },
      borderWidth: {
        '3': '3px',
        '40': '40px'
      },
      cursor: {
        grab: 'grab'
      },
    },
  },
  variants: {
    extend: {
      opacity: ['responsive']
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        '.container': {
          maxWidth: '100%',
          '@screen sm': {
            maxWidth: '540px',
          },
          '@screen md': {
            maxWidth: '767px',
          },
          '@screen lg': {
            maxWidth: '960px',
          },
          '@screen xl': {
            maxWidth: '1110px',
          },
        },
      });
    },
  ],
}
