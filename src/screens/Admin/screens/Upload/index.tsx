import React from 'react'
import Card from '../../components/Card'
import Uploader from './components/Uploader'

import s from './upload.module.scss'

const Upload = (): JSX.Element => {
    return <div className={s.container}>
        <Card header="Upload and process" className={s.upload}>
            <Uploader />
        </Card>
    </div>
}

export default Upload