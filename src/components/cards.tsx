import React from 'react';

interface User {
    id: number;
    title: string;
    name: string;
    age: number;
    email: string;
    phone: string;
    status: string;
}

interface CardProps {
    user: User;
}

const Card: React.FC<CardProps> = ({ user }) => {
    return (
        <div className="max-w-sm rounded overflow-hidden shadow-lg p-4 bg-white">
            <div className="text-center mt-4">
                <div className="text-xl font-bold">{user.name}</div>
                <p className="text-gray-600">{user.email}</p>
            </div>
        </div>
    );
};

export default Card;