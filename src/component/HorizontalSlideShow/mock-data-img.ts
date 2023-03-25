import GoogleImg from '../../resources/images/google.png'
import MozillaImg from '../../resources/images/mozilla.jpg'
import SafariImg from '../../resources/images/safari.png'
import OperaImg from '../../resources/images/opera.jpg'
import BraveImg from '../../resources/images/braves.jpg'
import BraveImg1 from '../../resources/images/braves.jpg'
import BraveImg2 from '../../resources/images/braves.jpg'
export interface ImageDataI {
	cover: string
	title: string
}
const images: ImageDataI[] = [
	{
		cover: GoogleImg,
		title: 'google',
	},
	{ cover: MozillaImg, title: 'mozilla' },
	{ cover: SafariImg, title: 'SafariImg' },
	{ cover: OperaImg, title: 'OperaImg' },
	{ cover: BraveImg, title: 'BraveImg' },
	{ cover: BraveImg1, title: 'BraveImg1' },
	{ cover: BraveImg2, title: 'BraveImg2' },
]

export default images

