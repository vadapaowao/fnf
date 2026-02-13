interface DriverBioProps {
    name: string;
    bio?: string;
}

export default function DriverBio({ name, bio }: DriverBioProps) {
    // Default bio if none provided
    const defaultBio = `${name} is a talented Formula 1 driver competing in the 2023 season. Known for exceptional skill and determination on the track.`;

    return (
        <div className="prose prose-invert max-w-none">
            <p className="text-xl text-gray-300 font-light leading-relaxed">
                {bio || defaultBio}
            </p>
        </div>
    );
}
