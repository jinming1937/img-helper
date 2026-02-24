import React from 'react'
import { ThemeToggle } from './ThemeToggle'
import './Header.css'

export const Header: React.FC = () => {
  return (
    <header className="header-bar">
      <div className="header-content">
        <h1 className="header-title">快速裁图</h1>
        <ThemeToggle />
      </div>
    </header>
  )
}
