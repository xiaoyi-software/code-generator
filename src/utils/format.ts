import dayjs from 'dayjs'

/**
 * 格式化日期时间
 * @param date 日期时间
 * @param format 格式化模式，默认为 YYYY-MM-DD HH:mm:ss
 * @returns 格式化后的日期时间字符串
 */
export const formatDateTime = (
  date: string | Date | undefined,
  format = 'YYYY-MM-DD HH:mm:ss'
): string => {
  if (!date) {
    return ''
  }
  return dayjs(date).format(format)
}

/**
 * 格式化日期
 * @param date 日期
 * @param format 格式化模式，默认为 YYYY-MM-DD
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: string | Date | undefined, format = 'YYYY-MM-DD'): string => {
  if (!date) {
    return ''
  }
  return dayjs(date).format(format)
}

/**
 * 格式化时间
 * @param date 时间
 * @param format 格式化模式，默认为 HH:mm:ss
 * @returns 格式化后的时间字符串
 */
export const formatTime = (date: string | Date | undefined, format = 'HH:mm:ss'): string => {
  if (!date) {
    return ''
  }
  return dayjs(date).format(format)
}
