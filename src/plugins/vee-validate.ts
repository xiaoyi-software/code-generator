import { App } from 'vue'
import { Form, Field, ErrorMessage, FieldArray, defineRule, configure } from 'vee-validate'
import {
  required,
  email,
  image,
  url,
  length,
  between,
  min,
  max,
  min_value,
  max_value,
  regex,
  integer,
  numeric,
  digits,
  confirmed
} from '@vee-validate/rules'

defineRule('required', required)
defineRule('email', email)
defineRule('image', image)
defineRule('url', url)
defineRule('length', length)
defineRule('between', between)
defineRule('min', min)
defineRule('max', max)
defineRule('min_value', min_value)
defineRule('max_value', max_value)
defineRule('regex', regex)
defineRule('integer', integer)
defineRule('numeric', numeric)
defineRule('digits', digits)
defineRule('confirmed', confirmed)

import { localize, setLocale } from '@vee-validate/i18n'
import zh_CN from '@vee-validate/i18n/dist/locale/zh_CN.json'
configure({
  generateMessage: localize({
    zh_CN
  })
})
setLocale('zh_CN')

export const setupVeeValidate = (app: App<Element>) => {
  app.component('VForm', Form)
  app.component('VField', Field)
  app.component('VErrorMessage', ErrorMessage)
  app.component('VFieldArray', FieldArray)
}
