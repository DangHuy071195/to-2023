import GoogleImg from '../../resources/images/google.png'
import MozillaImg from '../../resources/images/mozilla.jpg'
import SafariImg from '../../resources/images/safari.png'
import OperaImg from '../../resources/images/opera.jpg'
import BraveImg from '../../resources/images/braves.jpg'
import BraveImg1 from '../../resources/images/braves.jpg'
import BraveImg2 from '../../resources/images/braves.jpg'
export interface ImageDataI {
	url: string
	title: string
}
const images: ImageDataI[] = [
	{
		url: GoogleImg,
		title: 'google',
	},
	{ url: MozillaImg, title: 'mozilla' },
	{ url: SafariImg, title: 'SafariImg' },
	{ url: OperaImg, title: 'OperaImg' },
	{ url: BraveImg, title: 'BraveImg' },
	{ url: BraveImg1, title: 'BraveImg1' },
	{ url: BraveImg2, title: 'BraveImg2' },
]

export default images
