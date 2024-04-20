import { Process, RepoData } from '../../types'
import icon from '../../assets/icons/softwarecenter.svg'
import nullIcon from '../../assets/icons/application-default-icon.svg'

const Store: Process = {
  config: {
    name: 'Store',
    type: 'process',
    icon,
    targetVer: '1.0.0-indev.0'
  },
  run: async (process) => {
    const win = await process.loadLibrary('lib/WindowManager').then((wm: any) => {
      return wm.createWindow({
        title: 'Store',
        icon,
        width: 500,
        height: 700
      }, process)
    })

    const { fs } = process
    const HTML = await process.loadLibrary('lib/HTML')
    const { Button, Icon } = await process.loadLibrary('lib/Components')

    handle();

    function handle(): void {
      win.content.innerHTML = ''
      
      const div = new HTML('div').appendTo(win.content)
      fetch(`https://raw.githubusercontent.com/notCharonumThree/AppRepo/main/repo.json`)
        .then(async res => await res.json())
        .then((repo: RepoData) => {
          repo.apps.forEach((app) => {
            fs.exists(`/home/Applications/${app.url.split('/').at(-1)?.replace('.js', '.app') as string}`)
              .then((exists: boolean) => {
                const button = Button.new().style({
                  display: 'flex',
                  gap: '5px',
                  'align-items': 'center'
                }).text('Uninstall')
                  .prepend(Icon.new('delete'))
                  .on('click', () => uninstall(app.url))

                if (exists) {
                  fetch(app.url)
                    .then(async (res) => await res.text())
                    .then(async (data) => {
                      const local = Buffer.from(await fs.readFile(`/opt/apps/${app.url.split('/').at(-1) as string}`)).toString()
                      if (local !== data) {
                        button.text('Uninstall')
                          .prepend(Icon.new('delete'))
                          .un('click', () => uninstall(app.url))
                          .on('click', () => uninstall(app.url))
                      }
                    }).catch(e => console.error(e))
                } else {
                  button.text('Install')
                    .prepend(Icon.new('download'))
                    .un('click', () => uninstall(app.url))
                    .on('click', () => install(app.url))
                }

                new HTML('div')
                  .style({
                    display: 'flex',
                    'flex-direction': 'row',
                    gap: '10px',
                    padding: '10px',
                    background: 'var(--base)',
                    'border-radius': '10px'
                  })
                  .appendMany(
                    new HTML('img').attr({
                      src: app.icon ?? nullIcon
                    }).style({
                      'aspect-ratio': '1 / 1',
                      width: '60px',
                      height: '60px'
                    }),
                    new HTML('div').appendMany(
                      new HTML('h3').style({
                        margin: '0'
                      }).text(app.name),
                      button
                    )
                  )
                  .appendTo(div)
              }).catch(e => console.error(e))
          })
        })
        .catch(e => console.error(e))
    }

    function install (url: string): void {
      console.log(url)
      fetch(url).then(async (res) => await res.text())
        .then(async (data) => {
          await fs.writeFile(`/home/Applications/${url.split('/').at(-1)?.replace('.js', '.app') as string}`, `apps/${url.split('/').at(-1)?.split('.')[0] as string}`)
          await fs.writeFile(`/opt/apps/${url.split('/').at(-1) as string}`, data)
        }).catch(e => console.error(e))
    }

    function uninstall (url: string): void {
      fs.unlink(`/home/Applications/${url.split('/').at(-1)?.replace('.js', '.app') as string}`)
        .then(async () => {
          await fs.unlink(`/opt/apps/${url.split('/').at(-1) as string}`)
        })
        .catch(e => console.error(e))
    }
  }
}

export default Store
