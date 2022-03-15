import React, { useState } from 'react'
import CustomInput from '../../../components/CustomInput'
import s from './survey.module.scss'
import Select, { SingleValue } from 'react-select'
import {Survey as SurveyType} from '../../../types/Annotation'
import { useRecoilState } from 'recoil'
import { authState } from '../../../stores/auth'
import { service } from '../../../utils/api/AnnotationService'


type Gender = 'M' | 'F'
type Education = 'elementary' | 'highschool' | 'undergraduate' | 'graduate'

type GenderOptions = {
    value: Gender
    label: string
}

const genderOptions: GenderOptions[] = [{value: 'M', label: 'Lalaki'}, {value: 'F', label: 'Babae'}]

type EducationOptions = {
    value: Education
    label: string
}

const educationOptions: EducationOptions[] = [
    {value: 'elementary', label: 'Elementary'},
    {value: 'highschool', label: 'High School'},
    {value: 'undergraduate', label: 'Undergraduate'},
    {value: 'graduate', label: 'Graduate'}
]

const ERROR_MESSAGES = [
    'Walang laman.'
]

const AGE_ERROR = [
    'Walang laman.',
    'Bawal ang negatibong numero',
    'Mag lagay ng numero'
]


type SurveyProps = {
    onSubmit?: () => void
}

const Survey = ({ onSubmit }: SurveyProps): JSX.Element => {

    const [{code},] = useRecoilState(authState)

    const [name, setName] = useState('')
    const [age, setAge] = useState<number | undefined>()

    const [gender, setGender] = useState<Gender | undefined>()
    const [education, setEducation] = useState<Education | undefined>()

    const handleFormError = (value: string, errorSetter: React.Dispatch<React.SetStateAction<number>>) => {
        if (value === '') {
            errorSetter(0)
        }
    }

    const handleAgeError = (value: string, errorSetter: React.Dispatch<React.SetStateAction<number>>) => {
        if (value === '') {
            errorSetter(0)
        }

        const number = Number(value)

        if (isNaN(number)) {
            errorSetter(2)
        }

        if (number < 0) {
            errorSetter(1)
        }
    }

    const handleSexChange = (event: SingleValue<GenderOptions>) => {
        // XD ^
        
        setGender(event?.value)
    }

    const handleEducChange = (event: SingleValue<EducationOptions>) => {
        setEducation(event?.value)
    }

    const handleSubmit = () => {
        // submit the survey data here or validate form

        console.log({
            name: name,
            age: age,
            sex: gender,
            educ: education,
            code: code
        })
        if (!code || !age || !name || !gender || !education || isNaN(age)) {
            return
        }
        const survey: SurveyType = {
            name: name,
            age: age,
            sex: gender,
            educ: education,
            code: code
        }

        service.postSurvey(survey)

        if (onSubmit) {

            onSubmit()
        }
    }

    return <div className={s.container}>
        <div className={s.message}>
            Before proceeding, we would like to ask you for a survey. The information received will be used as part of our research and data aggregation methods.    
        </div>
        <div className={s.form}>
        <Select className={s.select} placeholder="Kasarian..." options={genderOptions} onChange={handleSexChange} />
            <Select className={s.select} placeholder="Antas ng edukasyon..." options={educationOptions} onChange={handleEducChange} />
            <CustomInput containerClass={s.nameInput} label='Pangalan' errorHandler={{
                errorMessages: ERROR_MESSAGES,
                onError: handleFormError
            }} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setName(e.target.value)
            }}  />
            <CustomInput containerClass={s.ageInput} label='Edad' min='1' errorHandler={{
                errorMessages: AGE_ERROR,
                onError: handleAgeError
            }} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setAge(Number(e.target.value))
            }}/>
            <div className={s.button} onClick={handleSubmit}>
                SUBMIT    
            </div>
        </div>
    </div>
}

export default Survey