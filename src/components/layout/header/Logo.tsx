import Image from "next/image";
import Link from "next/link";
import withBasePath from '@/lib/base-path'

const Logo: React.FC = () => {
    return (
        <Link href="/">
            <Image
                src={withBasePath('/images/logo/edumada-logo.svg')}
                alt="Edumada"
                width={860}
                height={270}
                className="h-12 w-auto"
                priority
            />
        </Link>
    );
};

export default Logo;
