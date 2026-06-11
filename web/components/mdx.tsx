import Link from 'next/link'
import Image, { ImageProps } from 'next/image'
import { MDXRemote, MDXRemoteProps } from 'next-mdx-remote/rsc'
import { highlight } from 'sugar-high'
import React, { ReactNode } from 'react'

type TableProps = {
  data: {
    headers: string[]
    rows: string[][]
  }
}

function Table({ data }: TableProps) {
  const headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ))

  const rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ))

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}

type CustomLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
}

function CustomLink({
  href,
  children,
  ...props
}: CustomLinkProps) {
  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  )
}

function RoundedImage(props: ImageProps) {
  return <Image className="rounded-lg" {...props} />
}

type CodeProps = React.HTMLAttributes<HTMLElement> & {
  children: string
}

function Code({ children, ...props }: CodeProps) {
  const codeHTML = highlight(children)

  return (
    <code
      dangerouslySetInnerHTML={{ __html: codeHTML }}
      {...props}
    />
  )
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  type HeadingProps = {
    children: ReactNode
  }

  const Heading = ({ children }: HeadingProps) => {
    const text =
      typeof children === 'string'
        ? children
        : React.Children.toArray(children).join(' ')

    const slug = slugify(text)

    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement('a', {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: 'anchor',
        }),
      ],
      children
    )
  }

  Heading.displayName = `Heading${level}`

  return Heading
}

const components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  a: CustomLink,
  code: Code,
  Table,
}

type CustomMDXProps = MDXRemoteProps & {
  components?: Record<string, React.ComponentType<any>>
}

export function CustomMDX({
  components: customComponents,
  ...props
}: CustomMDXProps) {
  return (
    <MDXRemote
      {...props}
      components={{
        ...components,
        ...customComponents,
      }}
    />
  )
}
