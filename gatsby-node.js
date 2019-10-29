const path = require('path')
const { slugify } = require('./src/util/utilityFunctions')
const authors = require('./src/util/authors')

exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions
  if (node.internal.type === 'MarkdownRemark') {
    const slugFromTitle = slugify(node.frontmatter.title)
    createNodeField({
      node,
      name: 'slug',
      value: slugFromTitle
    })
  }
}
exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions
  // Page templates
  const templates = {
    post: path.resolve('src/templates/single-post.js')
  }

  const res = await graphql(`
  {
    allMarkdownRemark {
      edges{
        node{
          frontmatter{
            author
          }
          fields{
            slug
          }
        }
      }
    }
  }
  `)
  if (res.errors) return Promise.reject(res.errors)

  const posts = res.data.allMarkdownRemark.edges

  posts.forEach(({ node }) => {
    createPage({
      path: node.fields.slug,
      component: templates.post,
      context: {
        // passing slug for template to use to get post
        slug: node.fields.slug,
        imageUrl: authors.find(x => x.name === node.frontmatter.author)
          .imageUrl
      }
    })
  })
}
