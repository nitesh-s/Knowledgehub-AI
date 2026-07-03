from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User, UserRole


class AuthService:
    def __init__(self, session: AsyncSession): self.session = session

    async def register(self, email: str, username: str, password: str, full_name: str | None = None) -> User:
        existing = await self.session.execute(select(User).where((User.email == email) | (User.username == username)))
        if existing.scalar_one_or_none():
            raise ValueError("Email or username already exists")
        user = User(email=email, username=username, hashed_password=hash_password(password), full_name=full_name, role=UserRole.employee)
        self.session.add(user)
        await self.session.flush()
        return user

    async def login(self, email: str, password: str) -> tuple[User, str]:
        result = await self.session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user or not verify_password(password, user.hashed_password):
            raise ValueError("Invalid email or password")
        if not user.is_active:
            raise ValueError("Account is disabled")
        token = create_access_token({"sub": str(user.id), "role": user.role.value})
        return user, token
