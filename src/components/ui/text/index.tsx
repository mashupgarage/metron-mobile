import React from 'react'
import type { VariantProps } from '@gluestack-ui/nativewind-utils'
import { Text as RNText } from 'react-native'
import { textStyle } from './styles'
import { useTheme } from '@gluestack-ui/themed'
import { useColorScheme } from 'react-native'

export type TextVariant = 'body' | 'heading' | 'mono'

type ITextProps = React.ComponentProps<typeof RNText> &
  VariantProps<typeof textStyle> & {
    variant?: TextVariant
  }

const Text = React.forwardRef<React.ElementRef<typeof RNText>, ITextProps>(
  (
    {
      className,
      isTruncated,
      bold,
      underline,
      strikeThrough,
      size = 'md',
      sub,
      italic,
      highlight,
      style,
      variant = 'body',
      ...props
    },
    ref
  ) => {
    // Use Gluestack theme fonts
    const theme = useTheme()
    // Fallbacks for fontFamily
    const fontFamily = theme?.fonts?.[variant] || theme?.fonts?.body || 'Inter'

    const colorScheme = useColorScheme()

    return (
      <RNText
        className={textStyle({
          isTruncated,
          bold,
          underline,
          strikeThrough,
          size,
          sub,
          italic,
          highlight,
          class: className,
        })}
        style={[
          { fontFamily, color: colorScheme === 'dark' ? '#FFFFFF' : '#202020' },
          style,
        ]}
        {...props}
        ref={ref}
      />
    )
  }
)

Text.displayName = 'Text'

export { Text }
