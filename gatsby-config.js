module.exports = {
  // Customize me!
  siteMetadata: {
    company: "Ralph Jonas D. Mungcal",
    domain: "https://asp143.github.io",
    defaultTitle: "Freelance Web Developer and InfoSec Enthusiast",
    preamble:
      "I am a Software Developer from Philippines.",
      // "We're a Portland, Oregon-based team of data scientists and software engineers.",
    defaultDescription:
    "I develop Website and other products that can help improve businesses. And I also provide software consulting to client to help them realize their software needs.",
    //   "We develop our own products. And provide software engineering and consulting to select clients.",
    postamble: "Think I can help your project? I'd love to hear from you:",
    contact: {
      email: "ralphmungcal09@gmail.com",
    },
    menuLinks: [],
  },
  pathPrefix: "/asp143",
  plugins: [
    "gatsby-transformer-remark",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-remove-serviceworker",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/src/pages`,
        name: "pages",
      },
    },
    {
      resolve: `gatsby-plugin-favicon`,
      options: {
        logo: "./images/temp.png",
      },
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: "UA-137881051-1",
      },
    },
  ],
};
