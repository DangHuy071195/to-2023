import GoogleImg from '../../resources/images/google.png'
import MozillaImg from '../../resources/images/mozilla.jpg'
import SafariImg from '../../resources/images/safari.png'
import OperaImg from '../../resources/images/opera.jpg'
import BraveImg from '../../resources/images/braves.jpg'
import BraveImg1 from '../../resources/images/braves.jpg'
import BraveImg2 from '../../resources/images/braves.jpg'
import { ReactNode } from 'react'
export interface ImageDataI {
	cover: string
	title: string
	children: string[] | []
}
const images: ImageDataI[] = [
	{
		cover: GoogleImg,
		title: 'google',
		children: ['browser', 'cloud', 'images'],
	},
	{ cover: MozillaImg, title: 'mozilla', children: ['addon', 'tools', 'cloud'] },
	{ cover: SafariImg, title: 'SafariImg', children: ['addon', 'tools', 'cloud'] },
	{ cover: OperaImg, title: 'OperaImg', children: ['addon', 'tools', 'cloud'] },
	{ cover: BraveImg, title: 'BraveImg', children: ['addon', 'tools', 'cloud'] },
	{ cover: BraveImg1, title: 'BraveImg1', children: ['addon', 'tools', 'cloud'] },
	{ cover: BraveImg2, title: 'BraveImg2', children: ['addon', 'tools', 'cloud'] },
]

export default images

