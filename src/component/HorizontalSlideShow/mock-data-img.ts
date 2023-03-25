import ChromeImg from '../../resources/images/chrome.png'
import MozillaImg from '../../resources/images/mozilla.jpg'
import SafariImg from '../../resources/images/safari.png'
import OperaImg from '../../resources/images/opera.jpg'
import IEImg from '../../resources/images/i-e.jpeg'
import UCImg from '../../resources/images/uc.jpeg'
import BraveImg from '../../resources/images/braves.jpg'
export interface ImageDataI {
	url: string
	title: string
	children: string[] | []
}
export const mockImages: ImageDataI[] = [
	{
		url: ChromeImg,
		title: 'google',
		children: ['browser', 'cloud', 'images'],
	},
	{ url: MozillaImg, title: 'mozilla', children: ['addon', 'tools', 'cloud'] },
	{ url: SafariImg, title: 'Safari', children: ['addon', 'tools', 'cloud'] },
	{ url: OperaImg, title: 'Opera', children: ['addon', 'tools', 'cloud'] },
	{ url: IEImg, title: 'Edge 11', children: ['addon', 'tools', 'cloud'] },
	{ url: UCImg, title: 'UC', children: ['addon', 'tools', 'cloud'] },
	{ url: BraveImg, title: 'Brave', children: ['addon', 'tools', 'cloud'] },
]

