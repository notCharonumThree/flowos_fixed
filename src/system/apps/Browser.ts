import icon from '../../assets/icons/web-browser.svg'
import { Process } from '../../types'

const BrowserApp: Process = {
  config: {
    name: 'Browser',
    type: 'process',
    icon,
    targetVer: '1.0.0-indev.0'
  },
  run: async (process) => {
    const win = await process.loadLibrary('lib/WindowManager').then(wm => {
      return wm.createWindow({
        title: 'Browser',
        icon,
        width: 500,
        height: 700
      }, process)
    })
    const HTML = await process.loadLibrary('lib/HTML')

    new HTML('iframe').attr({
      src: `${process.kernel.config['SERVER']}/0`,
    }).style({
      width: '100%',
      height: '100%',
      border: 'none',
      background: 'white'
    }).appendTo(win.content)
  }
}

export default BrowserApp
