import Image from "next/image";
import Link from "next/link";
import withBasePath from '@/lib/base-path'

const Logo: React.FC = () => {
    return (
        <Link href="/" className="shrink-0">
            <Image
                src={withBasePath('/images/logo/edumada-logo.svg')}
                alt="Edumada"
                width={828}
                height={270}
                className="h-12 w-auto max-w-none"
                priority
            />
        </Link>
    );
};

export default Logo;
